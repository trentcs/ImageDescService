require 'test_helper'

class DaisyBookControllerTest < ActionController::TestCase
  test "Extract book uid and title" do
    xml = File.read('features/fixtures/BookXMLWithImagesWithoutGroups.xml')
    doc = Nokogiri::XML xml
    book_uid = @controller.extract_book_uid(doc)
    assert_equal "en-us-20100517111839", book_uid
    book_title = @controller.extract_optional_book_title(doc)
    assert_equal 'Outline of U.S. History', book_title
    
    xml_without_uid = File.read('features/fixtures/BookXMLWithNoUID.xml')
    doc = Nokogiri::XML xml_without_uid
    begin
      @controller.extract_book_uid(doc)
      fail "Should have raised exception for missing book_uid"
    rescue MissingBookUIDException=>e
      #ignore expected
    end

    xml_without_title = File.read('features/fixtures/NotValidBook.xml')
    doc = Nokogiri::XML xml_without_title
    assert_nil @controller.extract_optional_book_title(doc)
  end
  
  test "Submit should create db images" do
    old_image_count = DynamicImage.count
    @controller.process_book('features/fixtures/DaisyZipBookUnencrypted.zip')
    after_processing_image_count = DynamicImage.count
    assert_not_equal old_image_count, after_processing_image_count
    @controller.process_book('features/fixtures/DaisyZipBookUnencrypted.zip')
    assert_equal after_processing_image_count, DynamicImage.count
  end
  
  test "Description count for book" do
    assert_equal 0, @controller.get_description_count_for_book("_id2244343")
    @controller.process_book('features/fixtures/DaisyZipBookUnencrypted.zip')
    assert_equal 0, @controller.get_description_count_for_book("_id2244343")
    di = DynamicImage.last
    dd = DynamicDescription.new
    dd.dynamic_image_id = di.id
    dd.body = "Sample description"
    dd.save
    assert_equal 1, @controller.get_description_count_for_book("_id2244343")
  end
end
