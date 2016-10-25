require 'page_stack/engine'

module PageStack

  def pagestack_layout
    # !request.xhr?
    return false if params[:pagestack].present?
  end

end
